import os
import databases
import sqlalchemy

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost/meetlogic_db")

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# Define your tables here, for example:
# users = sqlalchemy.Table(
#     "users",
#     metadata,
#     sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
#     sqlalchemy.Column("name", sqlalchemy.String),
#     sqlalchemy.Column("email", sqlalchemy.String, unique=True),
# )

# meeting_costs = sqlalchemy.Table(
#     "meeting_costs",
#     metadata,
#     sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
#     sqlalchemy.Column("role", sqlalchemy.String, unique=True),
#     sqlalchemy.Column("hourly_rate", sqlalchemy.Float),
# )

async def connect_to_db():
    print("Connecting to database...")
    await database.connect()
    print("Database connected.")
    # For local development, create tables if they don't exist
    # engine = sqlalchemy.create_engine(str(database.url))
    # metadata.create_all(engine)


async def disconnect_from_db():
    print("Disconnecting from database...")
    await database.disconnect()
    print("Database disconnected.")
