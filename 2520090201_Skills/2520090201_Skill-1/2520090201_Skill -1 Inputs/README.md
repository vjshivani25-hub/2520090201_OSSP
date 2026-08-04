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
