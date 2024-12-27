import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  private async sendMailSafely(mailOptions: any) {
    try {
      if (this.configService.get('SMTP_ENABLED') !== 'true') {
        this.logger.log('Email sending is disabled');
        return;
      }
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      // Don't throw the error to prevent it from breaking the main operation
    }
  }

  async sendWelcomeEmail(user: User) {
    await this.sendMailSafely({
      to: user.email,
      subject: 'Witamy w FitFleet AIOM!',
      html: `
        <h1>Witaj ${user.firstName}!</h1>
        <p>Cieszymy się, że jesteś z nami.</p>
      `,
    });
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    await this.sendMailSafely({
      to: user.email,
      subject: 'Reset hasła - FitFleet AIOM',
      html: `
        <h1>Reset hasła</h1>
        <p>Cześć ${user.firstName || ''},</p>
        <p>Otrzymaliśmy prośbę o reset hasła. Kliknij poniższy link, aby zresetować hasło:</p>
        <a href="${resetUrl}">Zresetuj hasło</a>
        <p>Link wygaśnie za 1 godzinę.</p>
        <p>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
      `,
    });
  }

  async sendRouteAssignmentEmail(user: User, route: any) {
    await this.sendMailSafely({
      to: user.email,
      subject: 'Nowa trasa przypisana - FitFleet AIOM',
      html: `
        <h1>Nowa trasa przypisana</h1>
        <p>Cześć ${user.firstName},</p>
        <p>Została Ci przypisana nowa trasa:</p>
        <h2>${route.name}</h2>
        <p>Szczegóły trasy:</p>
        <ul>
          ${route.stops
            .map(
              (stop: any) => `
            <li>
              <strong>${stop.name}</strong><br>
              Adres: ${stop.address}
            </li>
          `,
            )
            .join('')}
        </ul>
      `,
    });
  }

  async sendCarAssignmentEmail(user: User, car: any) {
    await this.sendMailSafely({
      to: user.email,
      subject: 'Przypisanie pojazdu - FitFleet AIOM',
      html: `
        <h1>Przypisanie pojazdu</h1>
        <p>Cześć ${user.firstName},</p>
        <p>Został Ci przypisany pojazd:</p>
        <ul>
          <li><strong>Pojazd:</strong> ${car.name}</li>
          <li><strong>Numer rejestracyjny:</strong> ${car.licensePlate}</li>
        </ul>
      `,
    });
  }

  async sendInvitationEmail(email: string, token: string) {
    const signupUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/signup?token=${token}`;
    await this.sendMailSafely({
      to: email,
      subject: 'Zaproszenie do FitFleet AIOM',
      html: `
        <h1>Zostałeś zaproszony!</h1>
        <p>Zostałeś zaproszony do dołączenia do aplikacji FitFleet AIOM. Kliknij poniższy link, aby dokończyć rejestrację:</p>
        <a href="${signupUrl}">Dokończ rejestrację</a>
        <p>Link wygaśnie za 24 godziny.</p>
        <p>Jeśli nie spodziewałeś się tego zaproszenia, zignoruj tę wiadomość.</p>
      `,
    });
  }
}
