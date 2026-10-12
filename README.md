# Flask Blog Web Application

A full-featured, local blogging web application built with Python and Flask, based on Corey Schafer's Flask tutorial series. The application is refactored using Flask Blueprints and a modular package structure, featuring user authentication, custom profile management, full CRUD operations for blog posts, custom error handling, and database integration.

---

## Features

- **User Authentication:** Registration, login, logout, and password management using Flask-Bcrypt and Flask-Login.
- **Post Management:** Create, read, update, and delete (CRUD) blog posts.
- **Profile Management:** Custom user profiles with profile picture uploads and updates.
- **Modular Architecture:** Structured with Flask Blueprints (`users`, `posts`, `main`, `errors`) for scalable route organization.
- **Custom Error Handling:** Dedicated error pages for 403, 404, and 500 HTTP errors.
- **Database Integration:** SQLite database managed with Flask-SQLAlchemy.
- **Forms & Validation:** Interactive forms powered by Flask-WTF and WTForms.

---

## Tech Stack

- **Backend:** Python, Flask
- **Database:** SQLite, Flask-SQLAlchemy
- **Authentication & Security:** Flask-Login, Flask-Bcrypt
- **Forms & Validation:** Flask-WTF, WTForms
- **Frontend:** HTML5, CSS3, Bootstrap 4, Jinja2 Templates

---

## Project Structure

```text
flask/
├── flaskblog/
│   ├── errors/          # Custom error handlers blueprint (403, 404, 500)
│   │   ├── __init__.py
│   │   └── handlers.py
│   ├── main/            # Core site routes (home, about)
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── posts/           # Blog post CRUD operations blueprint
│   │   ├── __init__.py
│   │   ├── forms.py
│   │   └── routes.py
│   ├── static/          # CSS stylesheets and user profile pictures
│   │   ├── profile_pics/
│   │   └── main.css
│   ├── templates/       # Jinja2 HTML templates and error pages
│   │   └── errors/
│   ├── users/           # User authentication and profile blueprint
│   │   ├── __init__.py
│   │   ├── forms.py
│   │   ├── routes.py
│   │   └── utils.py
│   ├── __init__.py      # App factory function
│   ├── config.py        # Configuration variables
│   └── models.py        # Database models (User, Post)
├── instance/            # SQLite database file directory
├── .env                 # Environment variables (secret keys, mail config)
├── .gitignore           # Git ignore rules
├── Pipfile              # Pipenv dependencies
├── Pipfile.lock         # Locked dependency tree
└── run.py               # Application entry point
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/Sohamm317/Flask-Website.git
cd Flask-Website
```

### 3. Set Up Virtual Environment

**Using `venv`:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Using Pipenv:**
```bash
pipenv install
pipenv shell
```

### 4. Install Dependencies (if using `pip`)
```bash
pip install flask flask-sqlalchemy flask-bcrypt flask-login flask-wtf email-validator Pillow python-dotenv
```

### 5. Run the Application
```bash
python run.py
```

Open your browser and navigate to `http://127.0.0.1:5000/`.

---

## Acknowledgments

- Built following [Corey Schafer's Flask Tutorial Series](https://www.youtube.com/playlist?list=PL-osiE80TeTs4UjLw5E61548pUJG-pC29).