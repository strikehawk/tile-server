# Use an official Node.js runtime as a parent image
FROM node:10.15.0-alpine

# Copy the 'pack' directory contents into the container at /app
COPY ./pack /app
COPY ./views /views
COPY ./docker/demo/server-options.json /config/server-options.json
COPY ./config/tile-matrix-sets /config/tile-matrix-sets
COPY ./config/map-sources/reliance-jio.json /config/map-sources/reliance-jio.json
COPY ./docker/demo/reliance-jio.json /config/layers/reliance-jio.json
COPY ./docker/demo/cache /cache

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the Node.js app when the container launches
ENTRYPOINT [ "node" ]
CMD ["app/app.js"]