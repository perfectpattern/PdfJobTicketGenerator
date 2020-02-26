rm test.pdf
curl -H "Content-Type: application/json" -d @gangjobevent.json -X POST http://127.0.0.1:8080 -o test.pdf