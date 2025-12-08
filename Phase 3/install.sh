#!/bin/bash

set -e

# -----------------------
# CONFIGURATION
# -----------------------
# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading database configuration from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found. Please create one based on the template."
    exit 1
fi

# Set default values if not provided in .env
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-default}
DB_NAME=${DB_NAME:-campus_insider}
DB_PORT=${DB_PORT:-3306}

BACKEND_DIR="./backend"   # adjust if needed
FRONTEND_DIR="./frontend" # adjust if needed
SQL_DIR="../Phase 2"    # folder containing your SQL files

# -----------------------
# HELPER FUNCTIONS
# -----------------------
install_if_missing() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Installing $1 with Homebrew..."



        # Install Homebrew if not installed
        if ! command -v brew >/dev/null 2>&1; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi

        # Package mapping for macOS
        case "$1" in
            python3)
                brew install python
                ;;
            python3-venv)
                # macOS bundles venv inside python3
                echo "python3 venv is included by default on macOS."
                ;;
            python3-pip)
                # pip3 is included with python3
                echo "pip3 is included with python3."
                ;;
            node)
                brew install node
                ;;
            npm)
                # npm comes with node
                brew install node
                ;;
            mysql)
                brew install mysql
                brew services start mysql
                ;;
            *)
                brew install "$1"
                ;;
        esac
    else
        echo "$1 already installed."
    fi
}

# -----------------------
# SYSTEM DEPENDENCIES
# -----------------------
if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -f /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi
echo "=== Checking system dependencies ==="
install_if_missing python3
install_if_missing python3-venv
install_if_missing python3-pip
install_if_missing node
install_if_missing npm
install_if_missing mysql

# -----------------------
# BACKEND SETUP
# -----------------------
echo "=== Setting up backend ==="
cd "$BACKEND_DIR"

# Create virtual environment if missing
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# -----------------------
# FRONTEND SETUP
# -----------------------
cd ".."

echo "=== Setting up frontend ==="
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi

# -----------------------
# DATABASE SETUP
# -----------------------
cd ".."
echo "=== Initializing MySQL database ==="

for sql_file in \
    "$SQL_DIR/schema-implementation/Combined Campus Insider.sql" \
    "$SQL_DIR/Functions.sql" \
    "$SQL_DIR/Indices.sql" \
    "$SQL_DIR/Procedures.sql" \
    "Database Feature/define_mysql_user.sql"
do
    echo "Running $sql_file..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" < "$sql_file"
done

# -----------------------
# INSERT INITIAL DATA
# -----------------------
echo "=== Inserting initial room data ==="

python3 ../"Phase 2"/web-scraping/insert_colleges.py || echo "insert_colleges.py failed, continuing..."
python3 ../"Phase 2"/web-scraping/insert_rooms.py || echo "insert_rooms.py failed, continuing..."
python3 ../"Phase 2"/web-scraping/insert_study_rooms.py || echo "insert_study_rooms.py failed, continuing..."

echo "=== INSTALLATION COMPLETE ==="
echo "You can now run the application using './run.sh' script."
