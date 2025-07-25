import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../usuarios/schemas/usuario.schema'; // Reutilizamos la definición de roles

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);