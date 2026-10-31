#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include "file_io.h"

void file_io_demo(void)
{
    const char *filename = "sample.txt";
    const char *message = "Linux File Descriptor Management System: file I/O demo.\n";
    char buffer[256];
    int fd = open(filename, O_CREAT | O_RDWR | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open");
        return;
    }

    printf("\n[FILE I/O DEMONSTRATION]\n");
    printf("Opened: %s\nFile descriptor: %d\n", filename, fd);

    size_t total = 0, length = strlen(message);
    while (total < length) {
        ssize_t n = write(fd, message + total, length - total);
        if (n == -1) {
            if (errno == EINTR) continue;
            perror("write");
            close(fd);
            return;
        }
        total += (size_t)n;
    }
    printf("Wrote %zu bytes successfully.\n", total);

    if (lseek(fd, 0, SEEK_SET) == (off_t)-1) {
        perror("lseek");
        close(fd);
        return;
    }

    ssize_t bytes = read(fd, buffer, sizeof(buffer) - 1);
    if (bytes == -1) {
        perror("read");
        close(fd);
        return;
    }
    buffer[bytes] = '\0';
    printf("Read %zd bytes. File content:\n%s", bytes, buffer);

    if (close(fd) == -1) perror("close");
    else printf("Descriptor %d closed successfully.\n", fd);
}
