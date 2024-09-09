#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <dirent.h>
#include <signal.h>
#include <termios.h>

#define MAX_INPUT_SIZE 4096
#define MAX_TOKEN_SIZE 256
#define MAX_NUM_TOKENS 128
#define MAX_PATH_LENGTH 1024

/* Function prototypes */
char **tokenize(char *line);
void execute_command(char **tokens);
int execute_builtin_command(char **tokens);
void execute_external_command(char **tokens);
void handle_io_redirection(char **tokens);
void handle_piping(char **tokens);
void handle_background_process(char **tokens);
char *expand_variables(char *token);
void setup_signal_handlers();

/* Built-in commands */
int cd_command(char **args);
int exit_shell(char **args);
int env_command(char **args);
int setenv_command(char **args);
int unsetenv_command(char **args);
int help_command(char **args);
int pwd_command(char **args);
int mkdir_command(char **args);
int rmdir_command(char **args);
int clear_command(char **args);
int ls_command(char **args);
int touch_command(char **args);

struct builtin {
    char *name;
    int (*func)(char **);
};

struct builtin builtins[] = {
    {"cd", cd_command},
    {"exit", exit_shell},
    {"env", env_command},
    {"setenv", setenv_command},
    {"unsetenv", unsetenv_command},
    {"help", help_command},
    {"pwd", pwd_command},
    {"mkdir", mkdir_command},
    {"rmdir", rmdir_command},
    {"clear", clear_command},
    {"ls", ls_command},
    {"touch", touch_command},
    {NULL, NULL}
};

/* Global variables */
char current_dir[MAX_PATH_LENGTH];

/* Main shell loop */
int main() {
    char input[MAX_INPUT_SIZE];
    char **tokens;
    int status = 1;

    setup_signal_handlers();
    getcwd(current_dir, sizeof(current_dir));

    do {
        printf("%s $ ", current_dir);
        fflush(stdout);

        if (fgets(input, sizeof(input), stdin) == NULL) {
            printf("\n");
            break;
        }

        input[strcspn(input, "\n")] = 0;  // Remove newline

        tokens = tokenize(input);
        if (tokens[0] != NULL) {
            execute_command(tokens);
        }

        // Free the allocated memory
        for (int i = 0; tokens[i] != NULL; i++) {
            free(tokens[i]);
        }
        free(tokens);

    } while (status);

    return 0;
}

/* Tokenize the input string */
char **tokenize(char *line) {
    char **tokens = malloc(MAX_NUM_TOKENS * sizeof(char*));
    char *token = strtok(line, " \t\r\n\a");
    int position = 0;

    while (token != NULL) {
        tokens[position] = expand_variables(token);
        position++;

        if (position >= MAX_NUM_TOKENS) {
            fprintf(stderr, "Too many tokens\n");
            exit(EXIT_FAILURE);
        }

        token = strtok(NULL, " \t\r\n\a");
    }
    tokens[position] = NULL;
    return tokens;
}

/* Execute the command */
void execute_command(char **tokens) {
    if (tokens[0] == NULL) {
        return;
    }

    // Check for piping
    for (int i = 0; tokens[i] != NULL; i++) {
        if (strcmp(tokens[i], "|") == 0) {
            handle_piping(tokens);
            return;
        }
    }

    // Check for I/O redirection
    handle_io_redirection(tokens);

    // Check for background process
    int background = 0;
    for (int i = 0; tokens[i] != NULL; i++) {
        if (strcmp(tokens[i], "&") == 0) {
            background = 1;
            tokens[i] = NULL;
            break;
        }
    }

    if (!execute_builtin_command(tokens)) {
        if (background) {
            handle_background_process(tokens);
        } else {
            execute_external_command(tokens);
        }
    }
}

/* Execute built-in commands */
int execute_builtin_command(char **tokens) {
    for (int i = 0; builtins[i].name != NULL; i++) {
        if (strcmp(tokens[0], builtins[i].name) == 0) {
            return builtins[i].func(tokens);
        }
    }
    return 0;
}

/* Execute external commands */
void execute_external_command(char **tokens) {
    pid_t pid = fork();

    if (pid == 0) {
        // Child process
        if (execvp(tokens[0], tokens) == -1) {
            perror("simple_shell");
        }
        exit(EXIT_FAILURE);
    } else if (pid < 0) {
        // Error forking
        perror("simple_shell");
    } else {
        // Parent process
        int status;
        do {
            waitpid(pid, &status, WUNTRACED);
        } while (!WIFEXITED(status) && !WIFSIGNALED(status));
    }
}

/* Handle I/O redirection */
void handle_io_redirection(char **tokens) {
    int i;
    int in_fd = -1, out_fd = -1;

    for (i = 0; tokens[i] != NULL; i++) {
        if (strcmp(tokens[i], "<") == 0) {
            in_fd = open(tokens[i+1], O_RDONLY);
            if (in_fd == -1) {
                perror("simple_shell");
                return;
            }
            dup2(in_fd, STDIN_FILENO);
            close(in_fd);
            tokens[i] = NULL;
            i++;
        } else if (strcmp(tokens[i], ">") == 0) {
            out_fd = open(tokens[i+1], O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (out_fd == -1) {
                perror("simple_shell");
                return;
            }
            dup2(out_fd, STDOUT_FILENO);
            close(out_fd);
            tokens[i] = NULL;
            i++;
        }
    }
}

/* Handle piping */
void handle_piping(char **tokens) {
    int i, j, k;
    int pipe_count = 0;
    int pipe_fds[2];
    pid_t pid;

    // Count pipes
    for (i = 0; tokens[i] != NULL; i++) {
        if (strcmp(tokens[i], "|") == 0) {
            pipe_count++;
        }
    }

    char ***commands = malloc((pipe_count + 1) * sizeof(char **));

    // Split tokens into separate commands
    for (i = 0, j = 0, k = 0; tokens[i] != NULL; i++) {
        if (strcmp(tokens[i], "|") == 0) {
            commands[j] = &tokens[k];
            tokens[i] = NULL;
            j++;
            k = i + 1;
        }
    }
    commands[j] = &tokens[k];

    for (i = 0; i <= pipe_count; i++) {
        if (i < pipe_count) {
            if (pipe(pipe_fds) == -1) {
                perror("simple_shell");
                return;
            }
        }

        pid = fork();

        if (pid == 0) {
            // Child process
            if (i < pipe_count) {
                dup2(pipe_fds[1], STDOUT_FILENO);
                close(pipe_fds[0]);
                close(pipe_fds[1]);
            }

            if (i > 0) {
                dup2(pipe_fds[0], STDIN_FILENO);
                close(pipe_fds[0]);
                close(pipe_fds[1]);
            }

            if (execvp(commands[i][0], commands[i]) == -1) {
                perror("simple_shell");
                exit(EXIT_FAILURE);
            }
        } else if (pid < 0) {
            perror("simple_shell");
            return;
        }

        if (i > 0) {
            close(pipe_fds[0]);
        }
        if (i < pipe_count) {
            close(pipe_fds[1]);
        }
    }

    // Parent waits for all child processes
    for (i = 0; i <= pipe_count; i++) {
        wait(NULL);
    }

    free(commands);
}

/* Handle background processes */
void handle_background_process(char **tokens) {
    pid_t pid = fork();

    if (pid == 0) {
        // Child process
        if (execvp(tokens[0], tokens) == -1) {
            perror("simple_shell");
        }
        exit(EXIT_FAILURE);
    } else if (pid < 0) {
        // Error forking
        perror("simple_shell");
    } else {
        // Parent process
        printf("[1] %d\n", pid);
    }
}

/* Expand environment variables */
char *expand_variables(char *token) {
    char *expanded = malloc(MAX_TOKEN_SIZE * sizeof(char));
    char *var_start, *var_end;
    char var_name[MAX_TOKEN_SIZE];
    char *var_value;

    strcpy(expanded, "");

    while ((var_start = strchr(token, '$')) != NULL) {
        strncat(expanded, token, var_start - token);
        var_start++;
        var_end = var_start;
        while (*var_end && (isalnum(*var_end) || *var_end == '_')) {
            var_end++;
        }
        strncpy(var_name, var_start, var_end - var_start);
        var_name[var_end - var_start] = '\0';

        var_value = getenv(var_name);
        if (var_value) {
            strcat(expanded, var_value);
        }
        token = var_end;
    }
    strcat(expanded, token);

    return expanded;
}

/* Setup signal handlers */
void setup_signal_handlers() {
    signal(SIGINT, SIG_IGN);  // Ignore Ctrl+C
    signal(SIGTSTP, SIG_IGN);  // Ignore Ctrl+Z
}

/* Built-in command functions */
int cd_command(char **args) {
    if (args[1] == NULL) {
        fprintf(stderr, "simple_shell: expected argument to \"cd\"\n");
    } else {
        if (chdir(args[1]) != 0) {
            perror("simple_shell");
        } else {
            getcwd(current_dir, sizeof(current_dir));
        }
    }
    return 1;
}

int exit_shell(char **args) {
    exit(EXIT_SUCCESS);
}

int env_command(char **args) {
    extern char **environ;
    for (char **env = environ; *env != NULL; env++) {
        printf("%s\n", *env);
    }
    return 1;
}

int setenv_command(char **args) {
    if (args[1] == NULL || args[2] == NULL) {
        fprintf(stderr, "Usage: setenv VARIABLE VALUE\n");
        return 1;
    }
    if (setenv(args[1], args[2], 1) != 0) {
        perror("simple_shell");
    }
    return 1;
}

int unsetenv_command(char **args) {
    if (args[1] == NULL) {
        fprintf(stderr, "Usage: unsetenv VARIABLE\n");
        return 1;
    }
    if (unsetenv(args[1]) != 0) {
        perror("simple_shell");
    }
    return 1;
}

int help_command(char **args) {
    printf("Simple Shell\n");
    printf("Type program names and arguments, and hit enter.\n");
    printf("Built-in commands:\n");
    for (int i = 0; builtins[i].name != NULL; i++) {
        printf("  %s\n", builtins[i].name);
    }
    printf("Use the man command for information on other programs.\n");
    return 1;
}

int pwd_command(char **args) {
    char cwd[MAX_PATH_LENGTH];
    if (getcwd(cwd, sizeof(cwd)) != NULL) {
        printf("%s\n", cwd);
    } else {
        perror("simple_shell");
    }
    return 1;
}

int mkdir_command(char **args) {
    if (args[1] == NULL) {
        fprintf(stderr, "Usage: mkdir DIRECTORY\n");
        return 1;
    }
    if (mkdir(args[1], 0777) != 0) {
        perror("simple_shell");
    }
    return 1;
}

int rmdir_command(char **args) {
    if (args[1] == NULL) {
        fprintf(stderr, "Usage: rmdir DIRECTORY\n");
        return 1;
    }
    if (rmdir(args[1]) != 0) {
        perror("simple_shell");
    }
    return 1;
}

int clear_command(char **args) {
    printf("\033[2J");  // Clear the entire screen
    printf("\033[H");   // Move cursor to home position (0, 0)
    return 1;
}

int ls_command(char **args) {
    DIR *dir;
    struct dirent *entry;
    char *path = args[1] ? args[1] : ".";

    dir = opendir(path);
    if (dir == NULL) {
        perror("simple_shell");
        return 1;
    }

    while ((entry = readdir(dir)) != NULL) {
        printf("%s  ", entry->d_name);
    }
    printf("\n");

    closedir(dir);
    return 1;
}

int touch_command(char **args) {
    if (args[1] == NULL) {
        fprintf(stderr, "Usage: touch FILE\n");
        return 1;
    }
    int fd = open(args[1], O_WRONLY | O_CREAT | O_NOCTTY | O_NONBLOCK, 0666);
    if (fd < 0) {
        perror("simple_shell");
    } else {
        close(fd);
    }
    return 1;
}