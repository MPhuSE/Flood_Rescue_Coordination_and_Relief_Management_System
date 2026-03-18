@echo off
set JAVA_EXE=C:\Users\Administrator\IdeaProjects\flood-rescue-system\.tools\jdk17\jdk-17.0.18+8\bin\java.exe
set JAR=C:\Users\Administrator\IdeaProjects\flood-rescue-system\target\flood-rescue-system-0.0.1-SNAPSHOT.jar

"%JAVA_EXE%" -jar "%JAR%" ^
  --spring.datasource.url=jdbc:h2:mem:runDb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE ^
  --spring.datasource.driver-class-name=org.h2.Driver ^
  --spring.datasource.username=sa ^
  --spring.datasource.password= ^
  --spring.jpa.hibernate.ddl-auto=create-drop ^
  --spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect ^
  --server.port=8080
