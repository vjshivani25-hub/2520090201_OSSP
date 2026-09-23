==================
        1Q
==================
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
int main()
{
    char command[100];
printf("Enter Linux Command: ");
scanf("%s", command);

pid_t pid = fork();

if (pid < 0)
{
    printf("Fork Failed!\n");
    return 1;
}

else if (pid == 0)
{
    printf("\nChild Process\n");
    printf("Child PID = %d\n", getpid());

    execlp(command, command, NULL);

    printf("Command execution failed.\n");
    exit(1);
}

else
{
    printf("\nParent Process\n");
    printf("Parent PID = %d\n", getpid());

    wait(NULL);

    printf("Child process completed.\n");
}

return 0;
}


==================
        2Q
==================
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
int main()
{
    int source, destination;
    char buffer[1024];
    ssize_t bytesRead;
    source = open("source.txt", O_RDONLY);

if (source < 0)
{
    printf("Cannot open source file.\n");
    return 1;
}

destination = open("destination.txt",
                   O_WRONLY | O_CREAT | O_TRUNC,
                   0644);

if (destination < 0)
{
    printf("Cannot create destination file.\n");
    close(source);
    return 1;
}

while ((bytesRead = read(source, buffer, sizeof(buffer))) > 0)
{
    write(destination, buffer, bytesRead);
}

close(source);
close(destination);

printf("File copied successfully.\n");

return 0;
}


==================
        3Q
==================
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>
int main()
{
    pid_t pid;
    pid = fork();

if (pid < 0)
{
    printf("Fork failed!\n");
    return 1;
}

else if (pid == 0)
{
    printf("\n----- Child Process -----\n");
    printf("Child PID  : %d\n", getpid());
    printf("Parent PID : %d\n", getppid());

    printf("Child is running...\n");
    sleep(10);

    printf("Child process exiting...\n");
    exit(0);
}

else
{
    printf("\n----- Parent Process -----\n");
    printf("Parent PID : %d\n", getpid());
    printf("Child PID  : %d\n", pid);

    printf("Parent waiting for child...\n");
    wait(NULL);

    printf("Child terminated.\n");
}

return 0;
}


==================
        4Q
==================
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>
int main()
{
    int i;
    pid_t pid;
    for(i = 1; i <= 3; i++)
{
    pid = fork();

    if(pid == 0)
    {
        printf("Child %d: PID = %d, PPID = %d\n",
                i, getpid(), getppid());

        sleep(i + 2);

        printf("Child %d completed.\n", i);
        exit(0);
    }
}

printf("\nParent PID = %d\n", getpid());

printf("\nWaiting using wait()...\n");

for(i = 1; i <= 3; i++)
{
    wait(NULL);
}

printf("All child processes finished.\n");

return 0;
}

==================
      4Q(a)
==================
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>
int main()
{
    pid_t pid[3];
    int i;
    for(i = 0; i < 3; i++)
{
    pid[i] = fork();

    if(pid[i] == 0)
    {
        printf("Child %d PID = %d\n", i + 1, getpid());

        sleep(i + 2);

        printf("Child %d Finished\n", i + 1);
        exit(0);
    }
}

for(i = 0; i < 3; i++)
{
    waitpid(pid[i], NULL, 0);
    printf("Parent collected Child %d\n", i + 1);
}

printf("All Children Completed\n");

return 0;
}

==================
       4Q(b)
==================
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
int main()
{
    pid_t pid;
    pid = fork();

if(pid == 0)
{
    printf("Child Process PID = %d\n", getpid());

    exit(0);
}
else
{
    printf("Parent PID = %d\n", getpid());

    printf("Sleeping for 20 seconds...\n");

    sleep(20);
}

return 0;
}

==================
       4Q(c)
==================
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>
int main()
{
    pid_t pid;
    pid = fork();

if(pid == 0)
{
    printf("Child Process PID = %d\n", getpid());

    exit(0);
}
else
{
    wait(NULL);

    printf("Zombie eliminated.\n");
}

return 0;
}


==================
       5Q(a)
==================
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>

int main()
{
    int fd[2];
    char buffer[100];

    pipe(fd);

    pid_t pid = fork();

    if(pid > 0)
    {
        close(fd[0]);

        char message[] = "Hello Child Process";

        write(fd[1], message, strlen(message)+1);

        printf("Parent Produced: %s\n", message);

        close(fd[1]);

        wait(NULL);
    }
    else
    {
        close(fd[1]);

        read(fd[0], buffer, sizeof(buffer));

        printf("Child Consumed: %s\n", buffer);

        close(fd[0]);
    }

    return 0;
}

 
==================
       5Q(b)
==================
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>

int main()
{
    int fd[2];

    pipe(fd);

    if(fork()==0)
    {
        dup2(fd[1], STDOUT_FILENO);

        close(fd[0]);
        close(fd[1]);

        execlp("ls","ls","-l",NULL);

        exit(0);
    }

    if(fork()==0)
    {
        dup2(fd[0], STDIN_FILENO);

        close(fd[1]);
        close(fd[0]);

        execlp("grep","grep",".c",NULL);

        exit(0);
    }

    close(fd[0]);
    close(fd[1]);

    wait(NULL);
    wait(NULL);

    return 0;
}


==================
       6Q
==================
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#define FIFO1 "client_to_server"
#define FIFO2 "server_to_client"
int main()
{
    char message[100];
    char response[200];
mkfifo(FIFO1, 0666);
mkfifo(FIFO2, 0666);

printf("Server started. Waiting for client...\n");

int read_fd = open(FIFO1, O_RDONLY);
int write_fd = open(FIFO2, O_WRONLY);

while (1)
{
    memset(message, 0, sizeof(message));

    read(read_fd, message, sizeof(message));

    printf("Client says: %s\n", message);

    if (strcmp(message, "exit") == 0 ||
        strcmp(message, "exit\n") == 0)
    {
        printf("Client disconnected.\n");
        break;
    }

    snprintf(response, sizeof(response),
             "Server processed: %s", message);

    write(write_fd, response, strlen(response) + 1);
}

close(read_fd);
close(write_fd);

unlink(FIFO1);
unlink(FIFO2);

return 0;
}


==================
       6Q(a)
==================
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#define FIFO1 "client_to_server"
#define FIFO2 "server_to_client"
int main()
{
    char message[100];
    char response[200];
printf("Client started.\n");

int write_fd = open(FIFO1, O_WRONLY);
int read_fd = open(FIFO2, O_RDONLY);

while (1)
{
    printf("Enter message: ");
    fflush(stdout);

    fgets(message, sizeof(message), stdin);

    message[strcspn(message, "\n")] = '\0';

    write(write_fd, message, strlen(message) + 1);

    if (strcmp(message, "exit") == 0)
    {
        break;
    }

    memset(response, 0, sizeof(response));

    read(read_fd, response, sizeof(response));

    printf("Server response: %s\n", response);
}

close(write_fd);
close(read_fd);

return 0;
}



==================
       7Q
==================
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int global_var = 100;          // Global initialized variable
int global_uninit;             // Global uninitialized variable

static int static_var = 200;   // Static initialized variable
static int static_uninit;      // Static uninitialized variable

void code_function()
{
    printf("This is a function in the code segment.\n");
}

int main()
{
    int stack_var = 300;                 // Stack variable
    int *heap_var = malloc(sizeof(int)); // Heap variable

    if (heap_var == NULL)
    {
        printf("Memory allocation failed.\n");
        return 1;
    }

    *heap_var = 400;

    printf("\n========== PROCESS MEMORY LAYOUT ==========\n\n");

    printf("PID                 : %d\n", getpid());

    printf("\n--- CODE SEGMENT ---\n");
    printf("Address of main()          : %p\n", (void *)main);
    printf("Address of code_function() : %p\n", (void *)code_function);

    printf("\n--- GLOBAL SEGMENT ---\n");
    printf("Address of global_var      : %p\n", (void *)&global_var);
    printf("Address of global_uninit   : %p\n", (void *)&global_uninit);

    printf("\n--- STATIC SEGMENT ---\n");
    printf("Address of static_var      : %p\n", (void *)&static_var);
    printf("Address of static_uninit   : %p\n", (void *)&static_uninit);

    printf("\n--- HEAP SEGMENT ---\n");
    printf("Address of heap_var        : %p\n", (void *)heap_var);

    printf("\n--- STACK SEGMENT ---\n");
    printf("Address of stack_var       : %p\n", (void *)&stack_var);

    printf("\n============================================\n");

    printf("\nProcess is running...\n");
    printf("Use another terminal to execute:\n");
    printf("cat /proc/%d/maps\n", getpid());
    printf("\nPress ENTER to terminate the process...\n");

    getchar();

    free(heap_var);

    return 0;
}
