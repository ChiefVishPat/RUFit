from app import create_app
from app.config import Config, DevelopmentConfig

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--dev', action='store_true', help='Use development configuration')
    args = parser.parse_args()

    if args.dev:
        app = create_app(DevelopmentConfig)
        print('Running in DEVELOPMENT mode with SQLite database')
    else:
        app = create_app(Config)
        print('Running in PRODUCTION mode with MySQL database')

    app.run(debug=args.dev)
