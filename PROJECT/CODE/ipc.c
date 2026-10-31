#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>
#include "ipc.h"

void pipe_fork_demo(void)
{
    int p[2];
    if (pipe(p) == -1) { perror("pipe"); return; }

    pid_t pid = fork();
    if (pid == -1) {
        perror("fork");
        close(p[0]); close(p[1]);
        return;
    }

    if (pid == 0) {
        close(p[1]);
        char buffer[128];
        ssize_t n;
        do { n = read(p[0], buffer, sizeof(buffer) - 1); }
        while (n == -1 && errno == EINTR);
        if (n == -1) perror("child read");
        else {
            buffer[n] = '\0';
            printf("\n[CHILD PROCESS]\nChild PID: %ld\nReceived: %s\n", (long)getpid(), buffer);
        }
        close(p[0]);
        fflush(stdout);
        _exit(n == -1 ? 1 : 0);
    }

    close(p[0]);
    const char *message = "Hello from parent through an anonymous pipe!";
    size_t sent = 0, len = strlen(message) + 1;
    while (sent < len) {
        ssize_t n = write(p[1], message + sent, len - sent);
        if (n == -1) {
            if (errno == EINTR) continue;
            perror("parent write");
            break;
        }
        sent += (size_t)n;
    }
    close(p[1]);

    int status;
    while (waitpid(pid, &status, 0) == -1) {
        if (errno != EINTR) { perror("waitpid"); return; }
    }
    printf("\n[PIPE + FORK IPC]\nParent PID: %ld\nChild PID: %ld\n", (long)getpid(), (long)pid);
    if (WIFEXITED(status) && WEXITSTATUS(status) == 0)
        printf("Child completed successfully; parent received child termination status.\n");
    else
        printf("Child did not exit successfully.\n");
}
