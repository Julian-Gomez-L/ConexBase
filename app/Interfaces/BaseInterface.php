<?php

namespace App\Interfaces;

interface BaseInterface

{
    public function create(array $data);
    public function getAll();
    public function getById(int $id);
    public function update(array $data, int $id);
    public function delete(int $id);
}