import * as prettier from 'prettier'
import { promises as fs } from 'fs'
import { join } from 'path'

interface CustomPrettierOptions {
	classesPerLine: number
	lineBreakAfterClasses: number
	indentStyle: 'tab' | 'space'
	indentSize: number
}

/**
 * Reads the .classbreakerrs file and returns its JSON content.
 * @returns {Promise<Partial<CustomPrettierOptions>>} The parsed configuration from .classbreakerrs.
 */
async function readClassBreakerConfig(): Promise<Partial<CustomPrettierOptions>> {
	const configPath = join(process.cwd(), '.classbreakerrs')
	try {
		const configFile = await fs.readFile(configPath, 'utf8')
		return JSON.parse(configFile)
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			// File does not exist
			return {}
		}
		throw error
	}
}

/**
 * Resolves and returns combined Prettier and .classbreakerrs configuration options.
 * @returns {Promise<CustomPrettierOptions>} An object containing the resolved configuration options.
 */
export async function resolvePrettierConfig(): Promise<CustomPrettierOptions> {
	// Obtains Prettier configurations from the current directory
	const prettierOptions = (await prettier.resolveConfig(process.cwd())) as Partial<CustomPrettierOptions>

	// Read custom .classbreakerrs configurations
	const classBreakerOptions = await readClassBreakerConfig()

	return {
		classesPerLine: classBreakerOptions.classesPerLine || prettierOptions.classesPerLine || 1,
		lineBreakAfterClasses: classBreakerOptions.lineBreakAfterClasses || prettierOptions.lineBreakAfterClasses || 5,
		indentStyle: classBreakerOptions.indentStyle || prettierOptions.indentStyle || 'space',
		indentSize: classBreakerOptions.indentSize || prettierOptions.indentSize || 4,
	}
}
