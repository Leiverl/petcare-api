import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../../usuarios/schemas/usuario.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos para la ruta desde la metadata
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso
    }

    // Obtenemos el usuario que fue adjuntado a la request por JwtStrategy
    const { user } = context.switchToHttp().getRequest();

    // Verificamos si el rol del usuario está incluido en los roles requeridos
    return requiredRoles.some((role) => user.rol?.includes(role));
  }
}