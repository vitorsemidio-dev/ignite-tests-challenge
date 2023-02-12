import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import { User } from "../modules/users/entities/User";
import { ICreateUserDTO } from "../modules/users/useCases/createUser/ICreateUserDTO";
import { IAuthenticateUserResponseDTO } from "../modules/users/useCases/authenticateUser/IAuthenticateUserResponseDTO";

type Override = Partial<ICreateUserDTO>;

export function makeUserDto(override: Override = {}) {
  return {
    email: "any_email@email.com",
    name: "any_name",
    password: "any_password",
    ...override,
  };
}

type OverrideUser = Partial<User>;

export function makeUser(override: OverrideUser = {}) {
  return {
    created_at: new Date(),
    email: "any_email@email.com",
    name: "any_name",
    password: "any_password",
    id: uuidv4(),
    updated_at: new Date(),
    statement: [],
    ...override,
  };
}

export async function makeE2EUser(
  appRequest: request.SuperTest<request.Test>,
  overrideCreateUserDto: Partial<ICreateUserDTO> = {}
) {
  const userDto = makeUserDto({
    ...overrideCreateUserDto,
  });
  await appRequest.post("/api/v1/users").send(userDto).expect(201);
  const { body } = await appRequest.post("/api/v1/sessions").send({
    email: userDto.email,
    password: userDto.password,
  });

  const sessionBody = body as IAuthenticateUserResponseDTO;
  const user = makeUser({
    ...sessionBody.user,
    ...userDto,
  });

  return {
    token: sessionBody.token,
    user,
  };
}
