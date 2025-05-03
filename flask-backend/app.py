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
        print('Running in PRODUCTION mode with MariaDB database')

    """ app.run(debug=args.dev)
    for testing with expo app"""
    app.run(debug=args.dev, host='0.0.0.0')
