# Save any files with sensitive information like environment variables or database passwords in GitHub repositories securely

A simple way to handle secrets by saving them in GitHub in encrypted form. You only need to remember one "master" password.

> WARNING: It is not recommended to save any sensitive information inside your repository. "git-secrets" will help you to save them encrypted in order to reduce the risks if you decide to save them anyway

For example to save the ".env" file safely in your repo:

1. Encrypt the file with a key. This will create the corresponding ".env.crypt" file with the contents of the .env encrypted and the ".env.key" file with the password inside
2. Commit the encrypted file ".env.crypt" in your repo
3. Add the ".env" and ".env.key" files in the git-ignore list

When you checkout the project on a new PC, just create the ".env.key" file with the password inside and git-secrets will decrypt it.

"git-secrets" can be used to encrypt any file type.

For each file you can use a different password and only the people that have the password can decrypt it. For example you can put the secrets that are used in the production environment in a separate file like in ".env.production" and use a different password to encrypt it.

Remember to always use a strong password to encrypt your files which cannot be found easily with "dictionary" or "brute-force" attacks.

## Installation

```bash
npm install @frangiskos/git-secrets
```

## Initialization

### STEP 1: Encrypt the files

See "How It Works" section below for instructions

### STEP 2: Add the files with your secrets in ".git-ignore".

Add the unencrypted files and keys in ".git-ignore" list. E.g. for ".env" file, you should add the following 2 entries in ".git-ignore"

-   .env
-   .env.key

(You should commit the ".env.crypt" file in your repository)

### STEP 3 (optional - recommended): Update the "start" script in "package.json" file

When someone makes changes in an encrypted file on your repo and you checkout the encrypted file, in order to update your decrypted copy automatically

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

## How it works

### Decrypting file with secrets

Simply run `npx git-secrets` from your terminal

When git-secrets runs without parameters (Run from terminal: `npx git-secrets`) it will perform the following steps:

-   Checks in the root folder of the project if there are any "\*.key" files
-   For every ".key" file in the root project folder (e.g. there is a file with name: ".env.key"):
-   -   It will read the first line of the file (this is the password that is used for the decryption)
-   -   It will check if there is a corresponding ".crypt" file with the encrypted content (e.g. .env.crypt)
-   -   It will try to decrypt the encrypted file with the password from the previous step
-   -   It will save the decrypted content to disk, overwriting any existing file (e.g. save the decrypted ".env" file)

### Encrypting a new file with secrets

To encrypt a file like ".env" for the first time there are 2 ways:

> Option 1: Run `npx git-secrets <filename> <password>`. E.g. `npx git-secrets .env mySuperStr0ngPassword!`

> Option 2: Create a corresponding ".key" file with the password inside (e.g. create the file ".env.key" with the text "mySuperStr0ngPassword!" inside) and run the git-secrets as before without entering a password `npx git-secrets <filename>` (e.g. `npx git-secrets .env)

### Updating an existing file with secrets

To update an existing file with secrets (e.g. to add a new entry in ".env" file) the same as encrypting a new file. But since the ".key" file is already there, it is the same with Option 2 of the encryption. To do so, run `npx git-secrets <filename>` (e.g. `npx git-secrets .env`).

> NOTE: Every time you make changes to an encrypted file you must encrypt the file again. If not, when the decrypt process runs (e.g. by running `npx git-secrets` manually or running it as part of your project "start" script) you will loose your changes

### Changing the password to an encrypted file

Simply encrypt the file again using a different password in the same way as you encrypt it the first time.
