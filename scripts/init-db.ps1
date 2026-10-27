$mysql = 'E:\mysql\bin\mysql.exe'
$root = 'D:\树洞'
$password = if ($env:MYSQL_ROOT_PASSWORD) { $env:MYSQL_ROOT_PASSWORD } else { '123456' }
Get-Content -Raw "$root\db\schema.sql" | & $mysql '--port=3307' -uroot "-p$password" --default-character-set=utf8mb4
if ($LASTEXITCODE -ne 0) { throw "数据库初始化失败" }
Write-Host '数据库初始化完成: beita_treehole'
