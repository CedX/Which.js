import {Finder} from "@cedx/which";
import {delimiter} from "node:path";
import {env} from "node:process";

/**
 * Tests the features of the {@link Finder} class.
 */
describe("Finder", () => {
	context("constructor()", () => {
		it("should set the `paths` property to the value of the `PATH` environment variable by default", () => {
			const pathEnv = env.PATH ?? "";
			const paths = pathEnv ? pathEnv.split(Finder.isWindows ? ";" : delimiter) : [];
			new Finder().paths.should.have.ordered.members(paths);
		});

		it("should set the `extensions` property to the value of the `PATHEXT` environment variable by default", () => {
			const pathExt = env.PATHEXT ?? "";
			const extensions = pathExt ? pathExt.split(";").map(item => item.toLowerCase()) : [".exe", ".cmd", ".bat", ".com"];
			new Finder().extensions.should.have.ordered.members(extensions);
		});

		it("should put in lower case the list of file extensions", () =>
			new Finder({extensions: [".EXE", ".JS", ".PS1"]}).extensions.should.have.ordered.members([".exe", ".js", ".ps1"]));
	});

	context("find()", () => {
		const finder = new Finder({paths: ["Resources"]});

		it("should return the path of the `Executable.cmd` file on Windows", async () => {
			const executables = await Array.fromAsync(finder.find("Executable"));
			executables.should.have.lengthOf(Finder.isWindows ? 1 : 0);
			if (Finder.isWindows) executables[0].endsWith("\\Resources\\Executable.cmd").should.be.true;
		});

		it("should return the path of the `Executable.sh` file on POSIX", async () => {
			const executables = await Array.fromAsync(finder.find("Executable.sh"));
			executables.should.have.lengthOf(Finder.isWindows ? 0 : 1);
			if (!Finder.isWindows) executables[0].endsWith("/Resources/Executable.sh").should.be.true;
		});

		it("should return an empty array if the searched command is not executable or not found", async () => {
			let executables = await Array.fromAsync(finder.find("NotExecutable.sh"));
			executables.should.be.empty;
			executables = await Array.fromAsync(finder.find("foo"));
			executables.should.be.empty;
		});
	});

	context("isExecutable()", () => {
		const finder = new Finder;

		it("should return `false` if the searched command is not executable or not found", async () => {
			(await finder.isExecutable("Resources/NotExecutable.sh")).should.be.false;
			(await finder.isExecutable("foo/bar/baz.qux")).should.be.false;
		});

		it("should return `false` for a POSIX executable, when test is run on Windows", async () =>
			(await finder.isExecutable("Resources/Executable.sh")).should.not.equal(Finder.isWindows));

		it("should return `false` for a Windows executable, when test is run on POSIX", async () =>
			(await finder.isExecutable("Resources/Executable.cmd")).should.equal(Finder.isWindows));
	});
});
