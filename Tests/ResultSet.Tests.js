import {Finder, which} from "@cedx/which";

/**
 * Tests the features of the {@link ResultSet} class.
 */
describe("ResultSet", () => {
	context("all", () => {
		const options = {paths: ["Resources"]};

		it("should return the path of the `Executable.cmd` file on Windows", async () => {
			const promise = which("Executable", options).all;
			if (!Finder.isWindows) await promise.should.be.rejected;
			else {
				const executables = await promise;
				Array.isArray(executables).should.be.true;
				executables.should.have.lengthOf(1);
				executables[0].endsWith("\\Resources\\Executable.cmd").should.be.true;
			}
		});

		it("should return the path of the `Executable.sh` file on POSIX", async () => {
			const promise = which("Executable.sh", options).all;
			if (Finder.isWindows) await promise.should.be.rejected;
			else {
				const executables = await promise;
				Array.isArray(executables).should.be.true;
				executables.should.have.lengthOf(1);
				executables[0].endsWith("/Resources/Executable.sh").should.be.true;
			}
		});

		it("should reject if the searched command is not executable or not found", async () => {
			await which("NotExecutable.sh", options).all.should.be.rejected;
			await which("foo", options).all.should.be.rejected;
		});
	});

	context("first", () => {
		const options = {paths: ["Resources"]};

		it("should return the path of the `Executable.cmd` file on Windows", async () => {
			const promise = which("Executable", options).first;
			if (!Finder.isWindows) await promise.should.be.rejected;
			else {
				const executable = await promise;
				executable.endsWith("\\Resources\\Executable.cmd").should.be.true;
			}
		});

		it("should return the path of the `Executable.sh` file on POSIX", async () => {
			const promise = which("Executable.sh", options).first;
			if (Finder.isWindows) await promise.should.be.rejected;
			else {
				const executable = await promise;
				executable.endsWith("/Resources/Executable.sh").should.be.true;
			}
		});

		it("should reject if the searched command is not executable or not found", async () => {
			await which("NotExecutable.sh", options).first.should.be.rejected;
			await which("foo", options).first.should.be.rejected;
		});
	});

	context("[Symbol.asyncIterator]()", () => {
		const options = {paths: ["Resources"]};

		it("should return the path of the `Executable.cmd` file on Windows", async () => {
			let found = false;
			for await (const executable of which("Executable", options)) {
				executable.endsWith("\\Resources\\Executable.cmd").should.be.true;
				found = true;
			}

			found.should.equal(Finder.isWindows);
		});

		it("should return the path of the `Executable.sh` file on POSIX", async () => {
			let found = false;
			for await (const executable of which("Executable.sh", options)) {
				executable.endsWith("/Resources/Executable.sh").should.be.true;
				found = true;
			}

			found.should.not.equal(Finder.isWindows);
		});

		it("should not return any result if the searched command is not executable or not found", async () => {
			let found = false;
			for await (const _ of which("NotExecutable.sh", options)); // eslint-disable-line @typescript-eslint/no-unused-vars
			found.should.be.false;

			found = false;
			for await (const _ of which("foo", options)); // eslint-disable-line @typescript-eslint/no-unused-vars
			found.should.be.false;
		});
	});
});
