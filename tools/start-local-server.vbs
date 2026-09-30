Option Explicit

Dim shell
Dim command

Set shell = CreateObject("WScript.Shell")
command = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File ""D:\www\Мебель\furniture-site\tools\start-local-server.ps1"""

shell.Run command, 0, False
