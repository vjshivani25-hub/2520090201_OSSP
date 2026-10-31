#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include "redirect.h"

void duplicate_fd_demo(void)
{
    int fd = open("sample.txt", O_CREAT | O_RDWR | O_APPEND, 0644);
    if (fd == -1) { perror("open sample.txt"); return; }

    int copy = dup(fd);
    if (copy == -1) {
        perror("dup");
        close(fd);
        return;
    }

    const char *line = "This line was written through a duplicated descriptor (dup).\n";
    size_t len = 0;
    while (len <  strlen(line)) {
        ssize_t n = write(copy, line + len, strlen(line) - len);
        if (n == -1) {
            if (errno == EINTR) continue;
            perror("write through duplicate");
            break;
        }
        len += (size_t)n;
    }
    printf("\n[DUP DEMONSTRATION]\nOriginal FD: %d\nDuplicated FD: %d\n", fd, copy);
    printf("Both descriptors refer to the same open file description.\n");
    if (close(copy) == -1) perror("close duplicate");
    if (close(fd) == -1) perror("close original");
    printf("Both descriptors closed.\n");
}

void redirect_stdout_demo(void)
{
    int file_fd = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (file_fd == -1) { perror("open output.txt"); return; }

    fflush(stdout);
    int saved_stdout = dup(STDOUT_FILENO);
    if (saved_stdout == -1) {
        perror("dup stdout");
        close(file_fd);
        return;
    }

    if (dup2(file_fd, STDOUT_FILENO) == -1) {
        perror("dup2 redirect");
        close(saved_stdout);
        close(file_fd);
        return;
    }
    printf("This text was redirected into output.txt using dup2().\n");
    printf("The original terminal stdout is restored after this message.\n");
    fflush(stdout);

    if (dup2(saved_stdout, STDOUT_FILENO) == -1) perror("restore stdout");
    close(saved_stdout);
    close(file_fd);
    printf("\nstdout restored. Open output.txt to see redirected text.\n");
}

void fcntl_demo(void)
{
    int fd = open("sample.txt", O_CREAT | O_RDWR, 0644);
    if (fd == -1) { perror("open sample.txt"); return; }

    int flags = fcntl(fd, F_GETFL);
    if (flags == -1) {
        perror("fcntl F_GETFL");
        close(fd);
        return;
    }

    printf("\n[FCNTL DEMONSTRATION]\nDescriptor: %d\n", fd);
    switch (flags & O_ACCMODE) {
        case O_RDONLY: printf("Access mode: read-only\n"); break;
        case O_WRONLY: printf("Access mode: write-only\n"); break;
        case O_RDWR:   printf("Access mode: read + write\n"); break;
        default:       printf("Access mode: unknown\n"); break;
    }
    printf("fcntl(F_GETFL) successfully retrieved file status flags.\n");
    close(fd);
    printf("Descriptor closed.\n");
}
