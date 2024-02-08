# Linking Two Private Repositories

To link two private repositories, you can use the approach of adding remote repositories to your local repository. Here's how you can do it:

1. Open your terminal or command prompt.

2. Navigate to the local directory of your main repository (https://{`username`}@bitbucket.org/chrome-ex/chrome-extension.git).

	```bash
	cd /path/to/your/local/repository
	git remote add additional https://dev.thisisalpha.com/bitbucket/scm/intern/text_highlighter_ext.git	
	```

	*Here, "additional" is just a name you choose for the remote repository. You can choose any unique name.*
	Now you have two remote repositories: "origin" for the main repository and "additional" for the extra one.
	
3. When you want to push changes to the additional repository, use the following command:

	```bash
	git push additional branch_name
	```