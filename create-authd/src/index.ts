import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";
import prompts from "prompts";
import { reset, red, lightBlue, magenta, cyan } from "kolorist";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import { blue, green, yellow } from "kolorist";

interface ColourFunc {
  (str: string | number): string;
}
interface FrameworkVariant {
  name: string;
  display: string;
  color: ColourFunc;
  customCommand?: string;
}
interface ModuleSystem {
  templateName: string;
  display: string;
  color: ColourFunc;
}
interface Framework {
  name: string;
  display: string;
  color: ColourFunc;
  variants?: FrameworkVariant[];
  moduleSystem?: ModuleSystem[];
}

// excludes numerical autoconversion of project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string.
const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2), { string: ["_"] });

const cwd = process.cwd();

const Frameworks: Framework[] = [
  {
    name: "nodejs",
    display: "NodeJs",
    color: green,
    moduleSystem: [
      {
        display: "Common JS",
        templateName: "nodejs-vanilla",
        color: magenta,
      },
      {
        display: "Module",
        templateName: "nodejs-module",
        color: lightBlue,
      },
    ],
    variants: [
      {
        name: "nodejs-mongo-vanilla",
        display: "JavaScript & MongoDB",
        color: yellow,
      },
      {
        name: "nodejs-postgres-vanilla",
        display: "JavaScript & Postgres",
        color: yellow,
      },
      {
        name: "nodejs-mongo-typescript",
        display: "Typescript & MongoDB",
        color: cyan,
      },
    ],
  },
];

const templates = Frameworks.map(
  (framework) =>
    (framework.variants &&
      framework.variants.map((variant) => variant.name)) || [framework.name]
).reduce((a, b) => a.concat(b), []);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultProjectName = "my-server";

async function initialise() {
  // trim directory name
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;

  let targetDir = argTargetDir || defaultProjectName;

  //   gets the project name from the directory
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    | "projectName"
    | "overwrite"
    | "packageName"
    | "framework"
    | "variant"
    | "moduleSystem"
    | "overwriteChecker"
  >;

  //   prompts
  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("Enter your project name:"),
          initial: defaultProjectName,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultProjectName;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },

        {
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name :(",
        },
        {
          type:
            argTemplate && templates.includes(argTemplate) ? null : "select",
          name: "framework",
          message:
            typeof argTemplate === "string" && !templates.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a framework:"),
          initial: 0,
          choices: Frameworks.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        {
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: reset("Select a variant: "),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
        {
          type: (framework: Framework) => {
            return framework && framework.moduleSystem ? "select" : null;
          },
          name: "moduleSystem",
          message: reset("Select a module system:"),
          choices: (framework: Framework) =>
            framework.moduleSystem.map((module) => {
              const moduleColor = module.color;
              return {
                title: moduleColor(module.display || module.templateName),
                value: module.templateName,
              };
            }),
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled :(");
            }
            return null;
          },
          name: "overwriteChecker",
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled :(");
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { packageName, overwrite, framework, variant, moduleSystem } = result;

  const rootPath = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(rootPath);
  } else if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true });
  }

  // determine template
  let template: string;
  if (moduleSystem) {
    template = moduleSystem || variant || framework?.name || argTemplate;
  } else {
    template = variant || framework?.name || argTemplate;
  }

  const pkgInfo = getPackageManager();
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  const { customCommand } =
    Frameworks.flatMap((framework) => framework.variants).find(
      (variant) => variant.name === template
    ) ?? {};

  if (customCommand) {
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === "bun") {
          return "bun x create-";
        }
        return `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace("@latest", () => (isYarn1 ? "" : "@latest"))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === "pnpm") {
          return "pnpm dlx";
        }
        if (pkgManager === "yarn" && !isYarn1) {
          return "yarn dlx";
        }
        if (pkgManager === "bun") {
          return "bun x";
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return "npm exec";
      });

    const [command, ...args] = fullCustomCommand.split(" ");

    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) =>
      arg.replace("TARGET_DIR", targetDir)
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }

  console.log(`\nStaging project in ${rootPath}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../",
    `template-${template.toLowerCase()}`
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(rootPath, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = packageName || getProjectName();

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  const cdProjectName = path.relative(cwd, rootPath);
  console.log(
    `\nDone. Now go to https://www.useplunk.com/ signup and grab your mailing api keys, then setup your config details`
  );
  console.log(`\nThen run:\n`);
  if (rootPath !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

function getPackageManager() {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const agent = process.env.npm_config_user_agent;

  if (!agent) {
    // This environment variable is set on Linux.
    const parent = process.env._;

    if (!parent) {
      // No luck, assume npm
      return {
        name: "npm",
      };
    }

    if (parent.endsWith("pnpx") || parent.endsWith("pnpm"))
      return {
        name: "pnpm",
      };
    if (parent.endsWith("yarn"))
      return {
        name: "yarn",
      };

    // Assume npm for anything else
    return {
      name: "npm",
    };
  }

  const program = agent.split(" ")[0];
  const programArr = program.split("/");
  return {
    name: programArr[0],
    version: programArr[1],
  };
}

initialise().catch((e) => {
  console.error(e);
});
