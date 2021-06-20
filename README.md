# Save any secrets in GitHub repositories securely

A simple way to handle secrets by saving them in GitHub

## Installation

```bash
npm install @frangiskos/git-secrets
```

## Initialization

### STEP 1: Update script to decrypt changed

This will decrypt any newer
In package.json change your start script to include git-secrets. For example

From this:

```json
    "scripts": {
        "start": "ts-node main.ts",
    },
```

To this:

```json
    "scripts": {
        "start": "git-secrets && ts-node main.ts",
    },
```

## How to use

Lets say you have 2 files you want to encrypt:

-   .env
-   .env.production

First we need to encrypt the 2 files:

RUN THE FOLLOWING TO ENCRYPT THE FILES:
`npx git-secrets .env MySecretP@SS`
`npx git-secrets .env MyOtherSecretP@SS`

This will create the following files:

-   .env.key // contains the key "MySecretP@SS" that is needed to decrypt .env
-   .env.production.key // contains the key "MyOtherSecretP@SS" that is needed to decrypt .env.prod
-   .env.crypt // contains the encrypted .env data
-   .env.production.crypt // contains the encrypted .env.prod data

(alternatively you can create the ".env.key" and ".env.production.key" files manually and then run `npx git-secrets .env` and `npx git-secrets .env.prod`)

add the following files in .gitignore

-   .env
-   .env.production
-   \*.key

Every time you want to update the .env you should run `git-secrets .env`. This will use the password in the .env.key file to update the .env.crypt file. You can commit the updated .env.crypt file in your git repository
