import { v4 as uuidv4 } from "uuid";
import { User } from "../modules/users/entities/User";
import { ICreateUserDTO } from "../modules/users/useCases/createUser/ICreateUserDTO";

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
