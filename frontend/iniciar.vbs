Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\jcmxo\98_pfm_traza_2025\frontend"
WshShell.Environment("Process")("NEXT_DISABLE_SWC") = "1"
WshShell.Run "cmd /c npm run dev", 0, False
WScript.Echo "Frontend iniciando en http://localhost:8000"

