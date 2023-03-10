# cargo backend

## How to run backend for development?

1. Start database (from backend root folder):
  docker-compose -f database.yml up -d

  If you have some issue, try above command with sudo or try to stop mysql service first (sudo service mysql stop) and then run this command again
2. Create autocompounder schema in database (if not exist)
3. Install dependencies:
  npm install
4. Run migration:
  npm run typeorm:run
5. Run project:
  npm start
6. Check if swagger working:
  http://localhost:3003/docs/
