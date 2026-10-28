<?php

namespace App\Exceptions;

use Exception;

class InvalidIdException extends Exception
{
    public string $errorCode; //atributo

    public function __construct(// constructor son parametros que la clase debe cumplir obligatoriamente
        string $errorCode,
        string $message
    ) {
        $this->errorCode = $errorCode;

        parent::__construct($message);
    }
}