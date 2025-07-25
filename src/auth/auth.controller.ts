import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve el token de acceso.'})
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.'})
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(loginUsuarioDto);
  }
  @Post('google')
  @ApiOperation({ summary: 'Iniciar sesión o registrarse con Google' })
  loginWithGoogle(@Body('token') token: string) {
    return this.authService.loginWithGoogle(token);
  }

  @Post('register-fcm')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un token de FCM para notificaciones' })
  registerFcmToken(@Req() req, @Body('fcmToken') fcmToken: string) {
    return this.authService.registerFcmToken(req.user.id, fcmToken);
  }
}