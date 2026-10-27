$env:JAVA_HOME = 'D:\Beita-dev\tools\jdk8u504-b01'
$env:M2_HOME = 'D:\Beita-dev\tools\apache-maven-3.9.11'
$env:MAVEN_OPTS = '-Dmaven.repo.local=D:\Beita-dev\maven-repository'
$env:Path = "$env:JAVA_HOME\bin;$env:M2_HOME\bin;E:\mysql\bin;$env:Path"
$env:DEV_LOGIN_ENABLED = 'true'
Set-Location 'D:\树洞'
& mvn spring-boot:run
