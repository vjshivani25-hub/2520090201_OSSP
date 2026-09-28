===============
      1Q
===============
#include <stdio.h>
#include <unistd.h>
int main()
{
    pid_t pid = fork();
    if(pid == 0)
{
    printf("Child Process\n");
    printf("PID = %d\n", getpid());
}
else
{
    printf("Parent Process\n");
    printf("PID = %d\n", getpid());
}

return 0;
}
===============
     1Q(a)
===============
#include <stdio.h>
#include <unistd.h>
int main()
{
    printf("Before exec()\n");
    execlp("date","date",NULL);
    printf("After exec()\n");
    return 0;
}


================
       2Q
================ 
#include <stdio.h>
#include <string.h>
#define MAX 100
int main()
{
    char input[MAX];
    while (1)
{
    printf("myshell> ");

    if (fgets(input, MAX, stdin) == NULL)
        break;

    input[strcspn(input, "\n")] = '\0';

    if (strcmp(input, "exit") == 0)
    {
        printf("Exiting Shell...\n");
        break;
    }

    if (strlen(input) == 0)
    {
        continue;
    }

    printf("You Entered: %s\n", input);
}

return 0;
}


================
       3Q
================ 
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define INITIAL_SIZE 100
#define HISTORY_SIZE 10
int main()
{
    char *buffer;
    int size = INITIAL_SIZE;
    buffer = (char *)malloc(size);

if(buffer == NULL)
{
    printf("Memory Allocation Failed\n");
    return 1;
}

char *history[HISTORY_SIZE];
int count = 0;

while(1)
{
    printf("\n\033[1;32mMyShell>\033[0m ");

    if(fgets(buffer, size, stdin) == NULL)
        break;

    buffer[strcspn(buffer,"\n")] = '\0';

    if(strcmp(buffer,"exit") == 0)
        break;

    if(strcmp(buffer,"history") == 0)
    {
        printf("\nCommand History:\n");

        for(int i=0;i<count;i++)
        {
            printf("%d : %s\n",i+1,history[i]);
        }

        continue;
    }

    if(count < HISTORY_SIZE)
    {
        history[count] = strdup(buffer);
        count++;
    }

    if(strlen(buffer) > size-10)
    {
        size *= 2;
        buffer = realloc(buffer,size);

        if(buffer==NULL)
        {
            printf("Memory Reallocation Failed\n");
            return 1;
        }
    }

    printf("Command Entered: %s\n",buffer);
}

for(int i=0;i<count;i++)
    free(history[i]);

free(buffer);

printf("Memory Released Successfully.\n");

return 0;
}


================
       4Q
================ 
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#define MAX_INPUT 100
#define MAX_TOKENS 20
int main()
{
    char input[MAX_INPUT];
    char *tokens[MAX_TOKENS];
    int count;
    while (1)
{
    printf("MyShell> ");

    if (fgets(input, sizeof(input), stdin) == NULL)
        break;

    input[strcspn(input, "\n")] = '\0';

    if (strlen(input) == 0)
    {
        printf("Empty command!\n");
        continue;
    }

    if (strcmp(input, "exit") == 0)
        break;

    count = 0;

    char *token = strtok(input, " \t");

    while (token != NULL && count < MAX_TOKENS)
    {
        tokens[count++] = token;
        token = strtok(NULL, " \t");
    }

    printf("\nTokens:\n");

    for (int i = 0; i < count; i++)
    {
        printf("Token %d : %s\n", i + 1, tokens[i]);
    }

    printf("\nParse Tree:\n");
    printf("Command\n");

    for (int i = 0; i < count; i++)
    {
        printf(" └── %s\n", tokens[i]);
    }

    printf("\nSyntax Valid.\n\n");
}

printf("Shell Closed.\n");
}

return 0;
}


================
       5Q
================ 
#include <stdio.h>
#include <string.h>
#define MAX 200
int main()
{
    char input[MAX];
    while (1)
{
    printf("MyShell> ");

    if (fgets(input, sizeof(input), stdin) == NULL)
        break;

    input[strcspn(input, "\n")] = '\0';

    if (strcmp(input, "exit") == 0)
        break;

    if (strlen(input) == 0)
    {
        printf("Empty Command!\n");
        continue;
    }

    printf("\nOriginal Command:\n%s\n", input);

    int single = 0;
    int dbl = 0;

    for (int i = 0; input[i] != '\0'; i++)
    {
        if (input[i] == '\'')
            single = !single;    
            if (input[i] == '"')
                dbl = !dbl;
        }

        printf("\nParsing Result:\n");

        if (single)
            printf("Error : Missing Closing Single Quote\n");
        else
            printf("Single Quotes : Valid\n");

        if (dbl)
            printf("Error : Missing Closing Double Quote\n");
        else
            printf("Double Quotes : Valid\n");

        printf("\nStored String:\n%s\n", input);
    }

    printf("\nShell Closed.\n");

    return 0;
}


================
      6Q(a)
================ 
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_INPUT 500
#define MAX_ARGS 50

void parse_input(char *input, char *args[]) {
    int argc = 0;
    int in_quotes = 0;
    int escape = 0;
    char *start = NULL;

    for (int i = 0; input[i] != '\0'; i++) {

        char c = input[i];

        if (escape) {
            if (start == NULL)
                start = &input[i];

            escape = 0;
            continue;
        }

        if (c == '\\') {
            if (start == NULL)
                start = &input[i + 1];

            escape = 1;
            continue;
        }

        if (c == '"') {
            in_quotes = !in_quotes;

            if (start == NULL)
                start = &input[i + 1];

            continue;
        }

        if (isspace((unsigned char)c) && !in_quotes) {
            if (start != NULL) {
                input[i] = '\0';
                args[argc++] = start;
                start = NULL;
            }
        } else {
            if (start == NULL)
                start = &input[i];
        }
    }

    if (start != NULL)
        args[argc++] = start;

    args[argc] = NULL;
}

int main() {
    char input[MAX_INPUT];
    char *args[MAX_ARGS];

    printf("===== SKILL 6: ESCAPE SEQUENCE PARSER =====\n");
    printf("Enter a command: ");

    if (fgets(input, sizeof(input), stdin) == NULL)
        return 1;

    input[strcspn(input, "\n")] = '\0';

    parse_input(input, args);

    printf("\nParsed Output:\n");

    int i = 0;

    while (args[i] != NULL) {
        printf("Argument %d: [%s]\n", i + 1, args[i]);
        i++;
    }

    printf("\nTotal arguments: %d\n", i);

    return 0;
}


================
      6Q(b)
================
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    pid_t pid;
    int status;

    printf("===== SKILL 6: PROCESS CREATION =====\n");

    printf("Parent Process PID: %d\n", getpid());

    pid = fork();

    if (pid < 0) {
        perror("fork failed");
        return 1;
    }

    if (pid == 0) {
        // Child process
        printf("\n--- CHILD PROCESS ---\n");
        printf("Child PID: %d\n", getpid());
        printf("Parent PID: %d\n", getppid());

        printf("Executing ls command...\n\n");

        execlp("ls", "ls", "-l", NULL);

        // This executes only if execlp fails
        perror("Execution failed");
        exit(1);
    }

    else {
        // Parent process
        printf("\n--- PARENT PROCESS ---\n");
        printf("Created Child PID: %d\n", pid);

        printf("Waiting for child process...\n");

        if (waitpid(pid, &status, 0) == -1) {
            perror("waitpid failed");
            return 1;
        }

        if (WIFEXITED(status)) {
            printf("\nChild exited normally.\n");
            printf("Child exit status: %d\n",
                   WEXITSTATUS(status));
        }
        else {
            printf("\nChild terminated abnormally.\n");
        }
    }

    printf("\nParent process completed.\n");

    return 0;
}



================
      7Q(a)
================
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    pid_t child1, child2;
    int status;

    printf("===== PROCESS SYNCHRONIZATION USING waitpid() =====\n");

    printf("Parent PID: %d\n", getpid());

    // Create first child
    child1 = fork();

    if (child1 < 0) {
        perror("fork failed");
        return 1;
    }

    if (child1 == 0) {
        printf("\nChild 1 started\n");
        printf("Child 1 PID: %d\n", getpid());

        sleep(2);

        printf("Child 1 completed\n");

        exit(10);
    }

    // Create second child
    child2 = fork();

    if (child2 < 0) {
        perror("fork failed");
        return 1;
    }

    if (child2 == 0) {
        printf("\nChild 2 started\n");
        printf("Child 2 PID: %d\n", getpid());

        sleep(4);

        printf("Child 2 completed\n");

        exit(20);
    }

    // Parent process
    printf("\nParent created two children.\n");
    printf("Child 1 PID: %d\n", child1);
    printf("Child 2 PID: %d\n", child2);

    printf("\nParent waiting for Child 1...\n");

    if (waitpid(child1, &status, 0) == -1) {
        perror("waitpid");
        return 1;
    }

    if (WIFEXITED(status)) {
        printf("Child 1 exited normally.\n");
        printf("Child 1 exit status: %d\n",
               WEXITSTATUS(status));
    }

    printf("\nParent waiting for Child 2...\n");

    if (waitpid(child2, &status, 0) == -1) {
        perror("waitpid");
        return 1;
    }

    if (WIFEXITED(status)) {
        printf("Child 2 exited normally.\n");
        printf("Child 2 exit status: %d\n",
               WEXITSTATUS(status));
    }

    printf("\nAll child processes completed.\n");
    printf("Parent process exiting.\n");

    return 0;
}


================
      7Q(b)
================
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>

#define MAX_PATH 4096

int main() {
    char *path;
    char *path_copy;
    char *directory;
    char full_path[MAX_PATH];

    char command[100];

    printf("===== PATH COMMAND RESOLUTION =====\n");

    // Retrieve PATH
    path = getenv("PATH");

    if (path == NULL) {
        printf("PATH variable not found.\n");
        return 1;
    }

    printf("\nPATH variable:\n%s\n", path);

    // Get command from user
    printf("\nEnter command to search: ");
    scanf("%99s", command);

    // Copy PATH because strtok modifies the string
    path_copy = strdup(path);

    if (path_copy == NULL) {
        perror("strdup");
        return 1;
    }

    // Parse PATH directories
    directory = strtok(path_copy, ":");

    while (directory != NULL) {

        // Create complete path
        snprintf(full_path, sizeof(full_path),
                 "%s/%s", directory, command);

        // Check if file exists
        if (access(full_path, F_OK) == 0) {

            printf("\nExecutable found:\n");
            printf("%s\n", full_path);

            // Verify execute permission
            if (access(full_path, X_OK) == 0) {
                printf("Execute permission: YES\n");
                printf("Command resolution successful.\n");

                free(path_copy);
                return 0;
            } else {
                printf("Execute permission: NO\n");
            }
        }

        // Move to next PATH directory
        directory = strtok(NULL, ":");
    }

    printf("\nCommand '%s' not found in PATH.\n",
           command);

    free(path_copy);

    return 1;
}


===============
     8Q(a)
===============
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_INPUT 500
#define MAX_OUTPUT 1000

void expand_variables(const char *input, char *output) {
    int i = 0;
    int j = 0;

    while (input[i] != '\0' && j < MAX_OUTPUT - 1) {

        // Detect variable reference
        if (input[i] == '$') {

            i++;

            // Handle ${VARIABLE}
            if (input[i] == '{') {
                i++;

                char variable[100];
                int k = 0;

                while (input[i] != '\0' &&
                       input[i] != '}' &&
                       k < 99) {
                    variable[k++] = input[i++];
                }

                variable[k] = '\0';

                if (input[i] == '}')
                    i++;

                char *value = getenv(variable);

                if (value != NULL) {
                    int v = 0;

                    while (value[v] != '\0' &&
                           j < MAX_OUTPUT - 1) {
                        output[j++] = value[v++];
                    }
                } else {
                    printf("Undefined variable: %s\n", variable);
                }
            }

            // Handle $VARIABLE
            else {
                char variable[100];
                int k = 0;

                while (isalnum((unsigned char)input[i]) ||
                       input[i] == '_') {

                    if (k < 99)
                        variable[k++] = input[i];

                    i++;
                }

                variable[k] = '\0';

                if (k == 0) {
                    output[j++] = '$';
                } else {
                    char *value = getenv(variable);

                    if (value != NULL) {
                        int v = 0;

                        while (value[v] != '\0' &&
                               j < MAX_OUTPUT - 1) {
                            output[j++] = value[v++];
                        }
                    } else {
                        printf("Undefined variable: %s\n",
                               variable);
                    }
                }
            }
        }

        else {
            output[j++] = input[i++];
        }
    }

    output[j] = '\0';
}

int main() {
    char input[MAX_INPUT];
    char output[MAX_OUTPUT];

    printf("===== VARIABLE EXPANSION =====\n");

    printf("Enter a string: ");

    if (fgets(input, sizeof(input), stdin) == NULL)
        return 1;

    input[strcspn(input, "\n")] = '\0';

    printf("\nOriginal input:\n%s\n", input);

    expand_variables(input, output);

    printf("\nExpanded output:\n%s\n", output);

    return 0;
}


===============
     8Q(b)
===============
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_INPUT 200
#define MAX_ARGS 20

// Function declarations
int builtin_pwd(char **args);
int builtin_cd(char **args);
int builtin_echo(char **args);
int builtin_exit(char **args);

// Structure for dispatch table
typedef struct {
    char *name;
    int (*function)(char **args);
} Builtin;

// Built-in command dispatch table
Builtin builtins[] = {
    {"pwd", builtin_pwd},
    {"cd", builtin_cd},
    {"echo", builtin_echo},
    {"exit", builtin_exit}
};

int builtin_count = sizeof(builtins) / sizeof(builtins[0]);

// pwd command
int builtin_pwd(char **args) {
    char cwd[1024];

    if (getcwd(cwd, sizeof(cwd)) != NULL) {
        printf("%s\n", cwd);
        return 0;
    }

    perror("pwd");
    return 1;
}

// cd command
int builtin_cd(char **args) {

    if (args[1] == NULL) {
        printf("cd: missing directory\n");
        return 1;
    }

    if (chdir(args[1]) != 0) {
        perror("cd");
        return 1;
    }

    return 0;
}

// echo command
int builtin_echo(char **args) {
    int i = 1;

    while (args[i] != NULL) {
        printf("%s", args[i]);

        if (args[i + 1] != NULL)
            printf(" ");

        i++;
    }

    printf("\n");

    return 0;
}

// exit command
int builtin_exit(char **args) {
    printf("Exiting shell...\n");
    exit(0);
}

// Execute built-in command
int execute_builtin(char **args) {

    if (args[0] == NULL)
        return 0;

    for (int i = 0; i < builtin_count; i++) {

        if (strcmp(args[0], builtins[i].name) == 0) {

            // Dispatch to appropriate function
            return builtins[i].function(args);
        }
    }

    printf("Invalid built-in command: %s\n", args[0]);

    return 1;
}

// Parse command
int parse_input(char *input, char **args) {

    int argc = 0;

    char *token = strtok(input, " \t");

    while (token != NULL && argc < MAX_ARGS - 1) {

        args[argc++] = token;

        token = strtok(NULL, " \t");
    }

    args[argc] = NULL;

    return argc;
}

int main() {

    char input[MAX_INPUT];
    char *args[MAX_ARGS];

    printf("===== BUILT-IN COMMAND DISPATCH =====\n");

    while (1) {

        printf("skill8-shell> ");
        fflush(stdout);

        if (fgets(input, sizeof(input), stdin) == NULL)
            break;

        input[strcspn(input, "\n")] = '\0';

        if (strlen(input) == 0)
            continue;

        parse_input(input, args);

        execute_builtin(args);
    }

    return 0;
}
