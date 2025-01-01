import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function sendInvitation() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    await authService.createInvitation('bieganski1996@gmail.com');
    console.log('Invitation sent successfully!');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to send invitation:', error.message);
    process.exit(1);
  }
}

sendInvitation();
