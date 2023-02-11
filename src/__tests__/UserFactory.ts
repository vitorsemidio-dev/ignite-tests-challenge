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
