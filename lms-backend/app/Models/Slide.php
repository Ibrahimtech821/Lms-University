<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slide extends Model
{
    protected $table="slides";
    protected $guarded = ['id'];

    public function course(){
        return $this->belongsTo(Course::class,"course_id","id");
    }
}
