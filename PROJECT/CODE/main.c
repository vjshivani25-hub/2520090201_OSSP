#include <stdio.h>
#include <stdlib.h>
#include "file_io.h"
#include "fd_table.h"
#include "redirect.h"
#include "ipc.h"
#include "monitor.h"

static int read_choice(void)
{
    char line[64], *end;
    if (!fgets(line, sizeof(line), stdin)) return 0;
    long value = strtol(line, &end, 10);
    while (*end == ' ' || *end == '\t' || *end == '\n' || *end == '\r') end++;
    if (end == line || *end != '\0') return -1;
    if (value < 0 || value > 8) return -1;
    return (int)value;
}

int main(void)
{
    for (;;) {
        printf("\n================================================\n");
        printf(" LINUX FILE DESCRIPTOR AND FILE I/O MANAGEMENT\n");
        printf("================================================\n");
        printf("1. File I/O (open, write, lseek, read, close)\n");
        printf("2. Display active file descriptor table\n");
        printf("3. Duplicate a descriptor using dup()\n");
        printf("4. Inspect descriptor flags using fcntl()\n");
        printf("5. Parent-child communication using pipe() + fork()\n");
        printf("6. Check file descriptor limits and usage\n");
        printf("7. Run a file descriptor leak test\n");
        printf("8. Redirect stdout using dup2()\n");
        printf("0. Exit\n");
        printf("------------------------------------------------\n");
        printf("Enter your choice: ");
        fflush(stdout);

        int choice = read_choice();
        if (choice == -1) {
            printf("Invalid input. Enter a menu number from 0 to 8.\n");
            continue;
        }
        switch (choice) {
            case 1: file_io_demo(); break;
            case 2: display_fd_table(); break;
            case 3: duplicate_fd_demo(); break;
            case 4: fcntl_demo(); break;
            case 5: pipe_fork_demo(); break;
            case 6: check_fd_limit(); break;
            case 7: detect_fd_leaks(); break;
            case 8: redirect_stdout_demo(); break;
            case 0: printf("Exiting safely. Goodbye!\n"); return 0;
            default: break;
        }
    }
}
