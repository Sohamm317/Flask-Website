from flaskblog import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)


# ALways do this before running the app in terminal
# this is for app context!
# $env:FLASK_APP = "run.py"
# flask shell