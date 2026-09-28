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
