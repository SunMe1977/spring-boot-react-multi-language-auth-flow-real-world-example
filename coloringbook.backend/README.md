Original Project updated and extended from
https://github.com/callicoder/spring-boot-react-oauth2-social-login-demo/tree/master/spring-social
https://www.callicoder.com/spring-boot-security-oauth2-social-login-part-1/

<h3>Key features</h3>
<ul>
  <li>Register new users</li>
  <li>Login users</li>
  <li>Bearer token authentication</li>
  <li>Sign in with google, facebook, github feature</li>
  <li>Email verification</li>
  <li>Forgot password</li>
</ul>

<h3>Technologies used</h3>
<ul>
  <li>Java: version-21</li>
  <li>Springboot: version-3</li>
  <li>Spring Security: version-6</li>
  <li>Oauth 2</li>
  <li>Rate Limiting</li>
  <li>Postgres</li>
  <li>Liquibase</li>
  <li>Swagger</li>
  <li>Smtp Mailer</li>
</ul>

<h3>Steps to run the application:</h3>

Set environment variables. Refer to `application.yml` and `application-prod.yml` for required variables.

**For Windows (Command Prompt):**
```bash
setx SWAGGER_PWD "secret123"
setx TOKEN_SECRET "04ca022b33612e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1"
setx GIT_SECRET "0f4019434d9d9bf339f340805e364fca523ca506"
setx MAIL_PASSWORD "secret123"
```

**For Linux/macOS (Bash/Zsh):**
```bash
export SWAGGER_PWD="secret123"
export TOKEN_SECRET="04ca022b33612e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1"
export GIT_SECRET="0f4019434d9d9bf339f340805e364fca523ca506"
export MAIL_PASSWORD="secret123"
```
(Note: For permanent environment variables on Linux/macOS, you might add these to your `~/.bashrc`, `~/.zshrc`, or `~/.profile` file.)

**Run Spring Boot application:**
```bash
mvn spring-boot:run
```

**For local PostgreSQL and pgAdmin using Docker Compose:**
```bash
docker compose up -d
```
(Refer to `docker-compose.yml` for details.)

**For production deployment:**
(Refer to `Dockerfile` for details.)

**Register the Auth API Keys on:**
*   Google: https://console.cloud.google.com/auth/clients/
*   Facebook: https://developers.facebook.com/apps/
*   GitHub: https://github.com/settings/apps

**Free hosted on:**
*   Java Docker: https://dashboard.render.com/
*   Postgres: https://railway.com/
*   Frontend: https://www.netlify.com/
