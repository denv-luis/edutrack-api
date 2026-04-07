from flask import Flask

app = Flask(__name__)

@app.route("/")
def inicio():
    return "API funcionando"

if __name__ == "__main__":
    print("INICIANDO SERVIDOR")
    app.run(port=5002, debug=True)