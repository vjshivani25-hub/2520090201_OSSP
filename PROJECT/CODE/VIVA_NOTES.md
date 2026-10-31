# Viva notes

## Short project introduction
Our project, **Linux File Descriptor and File I/O Management System**, is a menu-driven C application that demonstrates how Linux processes access files and other I/O resources through file descriptors. It demonstrates basic file operations, descriptor duplication, descriptor flags, output redirection, parent-child communication using an anonymous pipe, resource-limit monitoring, and descriptor cleanup.

## Common viva questions
1. **What is a file descriptor?** A small integer used by a process to identify an open file or I/O resource.
2. **What are standard file descriptors?** 0 is stdin, 1 is stdout, and 2 is stderr.
3. **What does `open()` return?** A non-negative descriptor on success, or -1 on failure.
4. **What is `dup()`?** It creates a new descriptor that refers to the same open file description as the original.
5. **What is `dup2()` used for?** It duplicates one descriptor onto a specified descriptor number; this project uses it to redirect stdout.
6. **What does `fcntl(fd, F_GETFL)` do?** It retrieves file status flags for an open descriptor.
7. **What is an anonymous pipe?** A unidirectional byte stream used for communication between related processes.
8. **Why call `fork()`?** It creates a child process.
9. **Why close unused pipe ends?** To avoid unnecessary open references and help readers observe end-of-file correctly.
10. **Why use `waitpid()`?** So the parent can wait for its child and collect its termination status.
11. **What is an FD leak?** A descriptor that remains open when the program no longer needs it.
12. **What is an FD soft limit?** The current process limit that can generally be changed up to the hard limit.
13. **What does `lseek()` do?** It changes the file offset for a seekable open file.
14. **What is `/proc/self/fd`?** A Linux procfs directory exposing links for the current process's open descriptors.

## Scope note
This project demonstrates file descriptors and basic process IPC. It does not currently implement named pipes (FIFOs), signal handling, process groups, sessions, or shell job control.
