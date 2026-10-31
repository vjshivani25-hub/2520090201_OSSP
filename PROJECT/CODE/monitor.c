#define _POSIX_C_SOURCE 200809L
#include <dirent.h>
#include <fcntl.h>
#include <stdio.h>
#include <sys/resource.h>
#include <unistd.h>
#include "monitor.h"

/* The directory opened for scanning is itself listed in /proc/self/fd.
   Subtract one so the returned count excludes that temporary scan FD. */
int count_open_fds(void)
{
    DIR *dir = opendir("/proc/self/fd");
    if (dir == NULL) { perror("opendir /proc/self/fd"); return -1; }
    int count = 0;
    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_name[0] >= '0' && entry->d_name[0] <= '9') count++;
    }
    closedir(dir);
    return count > 0 ? count - 1 : 0;
}

void check_fd_limit(void)
{
    struct rlimit limit;
    if (getrlimit(RLIMIT_NOFILE, &limit) == -1) { perror("getrlimit"); return; }
    int count = count_open_fds();
    if (count < 0) return;

    double usage = limit.rlim_cur == 0 ? 0.0 : 100.0 * count / (double)limit.rlim_cur;
    printf("\n[FILE DESCRIPTOR RESOURCE MONITOR]\n");
    printf("Currently open descriptors: %d\n", count);
    printf("Soft limit: %llu\n", (unsigned long long)limit.rlim_cur);
    printf("Hard limit: %llu\n", (unsigned long long)limit.rlim_max);
    printf("Soft-limit usage: %.4f%%\n", usage);
    printf("Status: %s\n", usage >= 80.0 ? "WARNING - usage is high" : "SAFE");
}

void detect_fd_leaks(void)
{
    int before = count_open_fds();
    if (before < 0) return;

    int temporary[5];
    int opened = 0;
    for (; opened < 5; opened++) {
        temporary[opened] = open("/dev/null", O_RDONLY);
        if (temporary[opened] == -1) { perror("open /dev/null"); break; }
    }
    int during = count_open_fds();

    for (int i = 0; i < opened; i++) close(temporary[i]);
    int after = count_open_fds();

    printf("\n[FILE DESCRIPTOR LEAK TEST]\n");
    printf("Open FD count before test : %d\n", before);
    printf("Open FD count during test : %d\n", during);
    printf("Temporary descriptors opened: %d\n", opened);
    printf("Open FD count after cleanup: %d\n", after);
    if (during >= 0 && after == before)
        printf("RESULT: PASS - descriptor count returned to baseline.\n");
    else
        printf("RESULT: CHECK REQUIRED - descriptor count did not return to baseline.\n");
}
