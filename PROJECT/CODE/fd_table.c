#define _POSIX_C_SOURCE 200809L
#include <dirent.h>
#include <stdio.h>
#include <unistd.h>
#include "fd_table.h"

void display_fd_table(void)
{
    DIR *dir = opendir("/proc/self/fd");
    if (dir == NULL) {
        perror("opendir /proc/self/fd");
        return;
    }

    printf("\n[ACTIVE FILE DESCRIPTORS]\n");
    printf("%-8s %s\n", "FD", "TARGET");
    printf("-----------------------------------------------\n");

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_name[0] < '0' || entry->d_name[0] > '9') continue;
        char path[512], target[512];
        int written = snprintf(path, sizeof(path), "/proc/self/fd/%s", entry->d_name);
        if (written < 0 || (size_t)written >= sizeof(path)) continue;
        ssize_t n = readlink(path, target, sizeof(target) - 1);
        if (n >= 0) {
            target[n] = '\0';
            printf("%-8s %s\n", entry->d_name, target);
        }
    }
    printf("-----------------------------------------------\n");
    printf("Note: this listing can include the temporary directory FD used to inspect /proc.\n");
    closedir(dir);
}
