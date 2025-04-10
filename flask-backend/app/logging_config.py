from loguru import logger

# Remove any previously configured handlers.
logger.remove()

# Configure the console logger with custom formatting.
logger.add(
    sink=lambda msg: print(msg, end=""),  # Direct to console only
    level="DEBUG",  # Set to DEBUG for detailed output; adjust as needed
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{module}</cyan>:<cyan>{function}</cyan> | "
    "<level>{message}</level>",
    colorize=True,  # Enable ANSI color codes in supported terminals
    diagnose=True,  # Include detailed diagnostic information on errors
)

# Example log messages:
logger.debug("Debug message with context")
logger.info("Application flow information")
logger.warning("Warning: potential issue detected")
logger.error("Error: something went wrong")
