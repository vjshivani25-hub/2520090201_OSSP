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
