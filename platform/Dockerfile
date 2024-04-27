# Use a specific version of the Python image
FROM python:3.11-slim-buster as build

# Install only the necessary packages for the build stage
RUN apt-get update && apt-get install -y \
  default-libmysqlclient-dev \
  openjdk-11-jdk \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.4.2

# Configure Poetry
RUN poetry config virtualenvs.in-project true

# Copy the pyproject.toml file
COPY pyproject.toml /app/src/

# Set the working directory
WORKDIR /app/src

# Install the dependencies
RUN poetry install --only main

# Remove unused packages
RUN apt-get purge -y \
  g++ \
  gcc \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

# Copy the application code
COPY . /app/src/

# Generate a requirements.txt file
RUN poetry export -f requirements.txt --output requirements.txt

# Use a new stage for the final image
FROM python:3.11-slim-buster as prod

# Install the dependencies from the requirements.txt file
RUN pip install -r requirements.txt

# Copy the application code
COPY --from=build /app/src /app/src

# Set the working directory
WORKDIR /app/src

# Run the application
CMD ["/usr/local/bin/python", "-m", "reworkd_platform"]
