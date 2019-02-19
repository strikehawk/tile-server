# Use an official Node.js runtime as a parent image
FROM node:10.15.0-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the 'pack' directory contents into the container at /app
COPY ./pack /app

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the Node.js app when the container launches
ENTRYPOINT [ "node" ]
CMD ["app/app.js"]