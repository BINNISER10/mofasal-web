from typing import Any, Optional
from fastapi import status
from fastapi.responses import JSONResponse


def success_response(data: Any = None, message: str = 'Success', status_code: int = status.HTTP_200_OK):
    return JSONResponse(
        status_code=status_code,
        content={'success': True, 'message': message, 'data': data},
    )


def created_response(data: Any = None, message: str = 'Created'):
    return success_response(data, message, status.HTTP_201_CREATED)


def paginated_response(items: list, total: int, page: int, limit: int, message: str = 'Success'):
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            'success': True,
            'message': message,
            'data': {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
            },
        },
    )


def error_response(message: str = 'Error', status_code: int = status.HTTP_400_BAD_REQUEST):
    return JSONResponse(
        status_code=status_code,
        content={'success': False, 'message': message},
    )
