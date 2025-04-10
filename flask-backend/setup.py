from setuptools import find_packages, setup

setup(
    name='flask-backend',
    version='0.1',
    packages=find_packages(include=['app', 'tools*']),
    package_dir={'': '.'},  # Important for non-standard layouts
)
