import { UserDatabase } from "../database/UserDatabase";
import { GetUsersInputDTO, GetUsersOutputDTO } from "../dtos/getUsers.dto";
import { LoginInputDTO, LoginOutputDTO } from "../dtos/login.dto";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/signup.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { USER_ROLES, User } from "../models/User";
import { IdGerator } from "../services/IdGerator";
import { TokenManage, tokenPayload } from "../services/TokenManage";

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGerator: IdGerator,
    private tokenManage: TokenManage
  ) {}

  public getUsers = async (
    input: GetUsersInputDTO
  ): Promise<GetUsersOutputDTO> => {
    const { q } = input;

    const usersDB = await this.userDatabase.findUsers(q);

    const users = usersDB.map((userDB) => {
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role,
        userDB.created_at
      );

      return user.toBusinessModel();
    });

    const output: GetUsersOutputDTO = users;

    return output;
  };

  public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {
    const { /* id, */ name, email, password } = input;

    const id = this.idGerator.gerate();

    const userDBExists = await this.userDatabase.findUserById(id);

    if (userDBExists) {
      throw new BadRequestError("'id' já existe");
    }

    const newUser = new User(
      id,
      name,
      email,
      password,
      USER_ROLES.NORMAL, // só é possível criar users com contas normais
      new Date().toISOString()
    );

    const newUserDB = newUser.toDBModel();
    await this.userDatabase.insertUser(newUserDB);

    const tokenPayload: tokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole(),
    };

    const token = this.tokenManage.createToken(tokenPayload);

    const output: SignupOutputDTO = {
      message: "Cadastro realizado com sucesso",
      token: token,
    };

    return output;
  };

  public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {
    const { email, password } = input;

    const userDB = await this.userDatabase.findUserByEmail(email);

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado");
    }

    if (password !== userDB.password) {
      throw new BadRequestError("'email' ou 'password' incorretos");
    }

    const tokenPayload: tokenPayload = {
      id: userDB.id,
      name: userDB.name,
      role: userDB.role,
    };

    const token = this.tokenManage.createToken(tokenPayload);

    const output: LoginOutputDTO = {
      message: "Login realizado com sucesso",
      token: token,
    };

    return output;
  };
}
